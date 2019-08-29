package io.temperate.ingest

import cats.implicits._
import com.monovore.decline._
import geotrellis.spark.store.kryo.KryoRegistrator
import org.apache.spark._
import org.apache.spark.serializer.KryoSerializer
import _root_.io.temperate.datamodel.{Dataset, Scenario}

object Main
    extends CommandApp(
      name = "area-indicators-ingest",
      header = "Copy NetCDF Climate Data to GeoTrellis Avro Layers for Area Indicators API",
      main = {

        val outputS3BucketOpt = Opts
          .argument[String]("outputS3Bucket")

        val outputS3KeyOpt = Opts
          .argument[String]("outputS3KeyPath")

        val datasetOpt = Opts
          .option[String]("dataset",
                          short = "d",
                          help = "The climate Dataset to run the ingest for")
          .withDefault("LOCA")
          .validate(s"dataset must be one of ${Dataset.options.map(_.name).mkString(",")}") {
            Dataset.unapply(_).isDefined
          }
          .map { Dataset.unapply(_).get }

        val scenarioOpt = Opts
          .option[String]("scenario",
                          short = "s",
                          help = "The climate Scenario to run the ingest for")
          .withDefault("rcp85")
          .validate(s"scenario must be one of ${Scenario.options.map(_.name).mkString(",")}") {
            Scenario.unapply(_).isDefined
          }
          .map { Scenario.unapply(_).get }

        (outputS3BucketOpt, outputS3KeyOpt, datasetOpt, scenarioOpt).mapN {
          (bucket, keyPath, dataset, scenario) =>
            val conf = new SparkConf()
              .setAppName(s"Temperate Area Indicators ClimateIngest: ${dataset}")
              .setIfMissing("spark.master", "local[*]")
              .set("spark.serializer", classOf[KryoSerializer].getName)
              .set("spark.kryo.registrator", classOf[KryoRegistrator].getName)
              .set("spark.kryoserializer.buffer.max", "1g")

            // Swap configs here depending on whether you want to write a debug SpatialKey
            // layer or a production SpaceTimeKey layer. Auto-selection based on a debug
            // flag got me stuck in compiler hell, so sorry about that.
            // val config = new DebugIngestConfig(dataset, scenario)
            val config = new ProductionIngestConfig(dataset, scenario)

            implicit val sc = new SparkContext(conf)
            val ingest      = new ClimateIngest(bucket, keyPath)
            ingest.run(config)
        }
      }
    )
