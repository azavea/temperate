package io.temperate.ingest

import com.typesafe.scalalogging.LazyLogging
import geotrellis.layer._
import geotrellis.raster._
import geotrellis.spark._
import geotrellis.spark.store.s3.S3LayerWriter
import geotrellis.store._
import geotrellis.store.avro.AvroRecordCodec
import geotrellis.store.s3.S3AttributeStore
import geotrellis.util._
import _root_.io.circe.Encoder
import _root_.io.temperate.datamodel._
import org.apache.spark.SparkContext
import ucar.nc2.NetcdfFile

import scala.reflect.ClassTag

class ClimateIngest(bucket: String, keyPrefix: String)(@transient implicit val sc: SparkContext)
    extends Serializable
    with LazyLogging {

  def run[K: SpatialComponent: AvroRecordCodec: Boundable: Encoder: ClassTag](
      config: IngestConfig[K]): Unit = {
    val climateModelCount = config.dataset.models.toSeq.size
    val variableCount     = Variable.options.toSeq.size
    val tileCount         = climateModelCount * variableCount

    val bConfig = sc.broadcast(config)

    val keyedTilesRdd =
      sc.parallelize(config.keys.toSeq, config.keys.size).map { key =>
        // This is all constant for the entire Key
        val dateTime     = bConfig.value.timeForKey(key)
        val spatialKey   = key.getComponent[SpatialKey]
        val keyExtent    = spatialKey.extent(bConfig.value.layoutDefinition)
        val minGridPoint = bConfig.value.dataset.gridPointForLatLng(keyExtent.southWest)
        val maxGridPoint = bConfig.value.dataset.gridPointForLatLng(keyExtent.northEast)
        val xSize        = math.abs(maxGridPoint._1 - minGridPoint._1)
        val ySize        = math.abs(maxGridPoint._2 - minGridPoint._2)

        val tileArray = Array.ofDim[Tile](tileCount)
        val modelVars = for {
          model    <- bConfig.value.dataset.models
          variable <- Variable.options
        } yield (model, variable)
        assert(modelVars.size == tileCount,
               s"modelVars.size ${modelVars.size} != tileCount ${tileCount}")

        modelVars.foreach {
          case (model: ClimateModel, variable: Variable) => {
            val index = bConfig.value.dataset.tileIndex(model, variable)
            val uri = bConfig.value.dataset
              .netCdfFileFor(model, bConfig.value.scenario, variable, dateTime.getYear)
            tileArray(index) = try {
              val netcdf = NetcdfFile.open(uri.toString)

              val latVar = netcdf.findVariable("lat")
              val yShape = latVar.getShape(0)
              assert(yShape == bConfig.value.dataset.ySize, s"yShape ${yShape} != ySize ${ySize}")
              val lonVar = netcdf.findVariable("lon")
              val xShape = lonVar.getShape(0)
              assert(xShape == bConfig.value.dataset.xSize, s"xShape ${xShape} != xSize ${xSize}")

              val dataVar  = netcdf.findVariable(variable.name.toLowerCase)
              val ucarType = dataVar.getDataType
              val nodata = dataVar
                .findAttributeIgnoreCase("_FillValue")
                .getValues
                .getFloat(0)

              val day = dateTime.getDayOfYear - 1 // one to zero indexing

              val origin: Array[Int] = Array(day, minGridPoint._2, minGridPoint._1)
              val size: Array[Int]   = Array(1, ySize, xSize)
              logger.info(s"Reading ${key}, ${model.name}, ${variable.name}\n    Origin: ${origin
                .mkString(", ")}\n    Size:   ${size.mkString(", ")}\n    Extent: ${spatialKey
                .extent(bConfig.value.layoutDefinition)}\n    NoData: ${nodata}")
              val data = dataVar
                .read(origin, size)
                // TODO: This will have to be handled more generically (likely defined at Dataset trait level) if we
                //       decide to also ingest GDDP
                .flip(1) // flip y back because Tile expects origin in top left but LOCA origin is bottom left
                .get1DJavaArray(ucarType)
                .asInstanceOf[Array[Float]]
              netcdf.close()
              // Different datasets have different nodata values. Massage all to use standard floatNODATA
              val cleanData = if (nodata != FloatConstantNoDataCellType.noDataValue) {
                data.map { v =>
                  if (v == nodata) FloatConstantNoDataCellType.noDataValue else v
                }
              } else {
                data
              }
              FloatArrayTile(cleanData, xSize, ySize)
            } catch {
              case e: Throwable => {
                logger.warn(s"Failed to read NetCDF: (${dateTime.toString}) ${uri.toString}")
                logger.warn(e.getLocalizedMessage)

                FloatConstantTile(floatNODATA, xSize, ySize)
              }
            }
          }
        }
        (key, MultibandTile(tileArray))
      }

    val outputRdd = MultibandTileLayerRDD(keyedTilesRdd, config.tileLayerMetadata)

    val layerName      = s"${config.dataset.name.toLowerCase}-${config.scenario.name.toLowerCase}"
    val layerId        = LayerId(layerName, 0)
    val attributeStore = S3AttributeStore(bucket, keyPrefix)
    val writer         = S3LayerWriter(attributeStore)
    writer.write(layerId, outputRdd, config.keyIndexMethod)
  }
}
