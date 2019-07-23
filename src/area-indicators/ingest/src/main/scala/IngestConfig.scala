package io.temperate.ingest

import java.time.ZonedDateTime

import geotrellis.layer._
import geotrellis.raster.{FloatConstantNoDataCellType, TileLayout}
import geotrellis.store.avro.AvroRecordCodec
import geotrellis.store.index.{KeyIndexMethod, ZCurveKeyIndexMethod}
import geotrellis.vector.Extent
import geotrellis.util._
import _root_.io.circe.Encoder
import io.temperate.datamodel.{Dataset, Scenario}

import scala.reflect.ClassTag

/**
  * IngestConfig is responsible for abstracting all operations in the ingest
  * that rely on SpatialKey + TemporalKey.
  *
  * We do this so that we can write SpatialKey layers at a single point in time
  * for debugging. Its way easier to access and visualize layer values via
  * geotrellis.contrib.vlm.RasterSource, but RasterSource only supports SpatialKey
  * at this time.
  */
abstract class IngestConfig[K: SpatialComponent: AvroRecordCodec: Boundable: Encoder: ClassTag](
    val dataset: Dataset,
    val scenario: Scenario)
    extends Serializable {
  def extent: Extent
  def keys: Set[K]
  def keyIndexMethod: KeyIndexMethod[K]
  def keyBounds: KeyBounds[K]            = keys.map(k => KeyBounds(k, k)).reduce(_ combine _)
  def layoutDefinition: LayoutDefinition = LayoutDefinition(extent, tileLayout)
  def tileLayout: TileLayout
  def tileLayerMetadata: TileLayerMetadata[K]
  def timeForKey(key: K): ZonedDateTime
}

class DebugIngestConfig(dataset: Dataset, scenario: Scenario)
    extends IngestConfig[SpatialKey](dataset, scenario) {
  val extent                                          = dataset.extent
  val gcd                                             = dataset.pixelGcd
  lazy val keys: Set[SpatialKey]                      = layoutDefinition.mapTransform.keysForGeometry(extent.toPolygon)
  lazy val keyIndexMethod: KeyIndexMethod[SpatialKey] = ZCurveKeyIndexMethod
  lazy val tileLayout: TileLayout                     = TileLayout(gcd, gcd, dataset.xSize / gcd, dataset.ySize / gcd)
  lazy val tileLayerMetadata = TileLayerMetadata[SpatialKey](
    FloatConstantNoDataCellType,
    layoutDefinition,
    extent,
    dataset.crs,
    keyBounds
  )

  def timeForKey(key: SpatialKey): ZonedDateTime = DayOfYearTuple(2020, 1).toZonedDateTime.get
}

class ProductionIngestConfig(dataset: Dataset, scenario: Scenario)
    extends IngestConfig[SpaceTimeKey](dataset, scenario) {

  val extent = dataset.extent
  val gcd    = dataset.pixelGcd
  lazy val keys: Set[SpaceTimeKey] = {
    val spatialKeys = layoutDefinition.mapTransform.keysForGeometry(extent.toPolygon)
    val maybeDateTimes: Iterable[Option[ZonedDateTime]] = for {
      // TODO #1265: Improve performance such that we can scale up to this
      // year <- scenario.years
      year <- Seq(2020)
      day  <- 1 to 366
    } yield DayOfYearTuple(year, day).toZonedDateTime
    val dateTimes = maybeDateTimes.flatten
    for {
      spatialKey <- spatialKeys
      dateTime   <- dateTimes
    } yield SpaceTimeKey(spatialKey, TemporalKey(dateTime))
  }
  lazy val keyIndexMethod: KeyIndexMethod[SpaceTimeKey] = ZCurveKeyIndexMethod.byDay
  lazy val tileLayout: TileLayout                       = TileLayout(gcd, gcd, dataset.xSize / gcd, dataset.ySize / gcd)
  lazy val tileLayerMetadata = TileLayerMetadata[SpaceTimeKey](
    FloatConstantNoDataCellType,
    layoutDefinition,
    extent,
    dataset.crs,
    keyBounds
  )

  def timeForKey(key: SpaceTimeKey): ZonedDateTime = key.getComponent[TemporalKey].time
}
