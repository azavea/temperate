package io.temperate.datamodel.methods

import geotrellis.util.MethodExtensions
import io.temperate.datamodel._
import io.temperate.datamodel.ClimateModel._

/**
  * This trait is an extension on Dataset as a separate file so that we can maintain
  * these verbose static mappings in one place, without cluttering the core definition
  * of what a Dataset is.
  */
trait TileIndexMethods extends MethodExtensions[Dataset] {

  def tileIndex(model: ClimateModel, variable: Variable): Int = {
    val modelIndex = climateModelIndex(model)
    val varIndex   = variableIndex(variable)
    modelIndex + varIndex * self.models.size
  }

  // This method is responsible for determining the order of tiles encoded in the
  // ingested MultibandTile of geotrellis layer.
  // If you change the values returned or add/remove entries you'll need to re-run the ingest, otherwise
  // you'll pull data from the wrong Tile.
  // This is left as an explicit list to force a pause when changes are made. Returning something like a sorted
  // list of all options would abstract away the idea that this explicit ordering is critical and allow for
  // subtle bugs in returning the correct Tile for given model.
  def climateModelIndex(model: ClimateModel): Int = {
    if (self == Dataset.Loca) {
      model match {
        case Access10     => 0
        case Access13     => 1
        case BccCsm11     => 2
        case BccCsm11M    => 3
        case CanEsm2      => 4
        case Ccsm4        => 5
        case Cesm1Bgc     => 6
        case Cesm1Cam5    => 7
        case CmccCm       => 8
        case CmccCms      => 9
        case CnrmCm5      => 10
        case CsiroMk360   => 11
        case EcEarth      => 12
        case FGoalsG2     => 13
        case GfdlCm3      => 14
        case GfdlEsm2G    => 15
        case GfdlEsm2M    => 16
        case GissE2H      => 17
        case GissE2R      => 18
        case HadGem2Ao    => 19
        case HadGem2Cc    => 20
        case HadGem2Es    => 21
        case Inmcm4       => 22
        case IpslCm5ALr   => 23
        case IpslCm5AMr   => 24
        case Miroc5       => 25
        case MirocEsm     => 26
        case MirocEsmChem => 27
        case MpiEsmLr     => 28
        case MpiEsmMr     => 29
        case MriCgcm3     => 30
        case NorEsm1M     => 31
        case _            => throw new IllegalArgumentException(s"${model.name} not found")
      }
    } else {
      throw new IllegalArgumentException(s"${self.name} not supported")
    }
  }

  // This method has the same considerations as climateModelIndex above. See comments there for details.
  // This method is responsible for determining the order of tiles encoded in the output geotrellis layer
  // If you change the values returned or add/remove entries you'll need to re-run the ingest
  def variableIndex(variable: Variable): Int = {
    variable match {
      case Variable.TasMax => 0
      case Variable.TasMin => 1
      case Variable.Precip => 2
      case _               => throw new IllegalArgumentException(s"${variable.name} not found")
    }
  }
}
