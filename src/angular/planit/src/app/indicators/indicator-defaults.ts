import {
    Dataset,
    Scenario
} from 'climate-change-components';

export const DEFAULT_SCENARIO: Scenario = {
  name: 'RCP85',
  label: 'RCP 8.5',
  // tslint:disable-next-line:max-line-length
  description: 'Rising radiative forcing pathway leading to 8.5 W/m2 in 2100. See https://www.skepticalscience.com/rcp.php'
};

export const DEFAULT_DATASET: Dataset = {
    name: 'LOCA',
    label: 'Localized Constructed Analogs Downscaled Projections',
    description: 'The LOCA (Localized Constructed Analogs) dataset includes downscaled projections from 32 global climate models calculated for two Representative Concentration Pathways (RCP 4.5 and RCP 8.5). Each of the climate projections includes daily maximum temperature, minimum temperature, and precipitation for every 6x6km (1/16th degree resolution) for the conterminous US from 1950 to 2100. LOCA attempts to better preserve extreme hot days, heavy rain events and regional patterns of precipitation. The total dataset size is approximately 10 TB.',
    url: 'http://loca.ucsd.edu/',
    models: [
        'ACCESS1-0',
        'CCSM4',
        'CESM1-BGC',
        'CNRM-CM5',
        'CSIRO-Mk3-6-0',
        'CanESM2',
        'GFDL-CM3',
        'GFDL-ESM2G',
        'GFDL-ESM2M',
        'IPSL-CM5A-LR',
        'IPSL-CM5A-MR',
        'MIROC-ESM-CHEM',
        'MIROC-ESM',
        'MIROC5',
        'MPI-ESM-LR',
        'MPI-ESM-MR',
        'MRI-CGCM3',
        'NorESM1-M',
        'bcc-csm1-1',
        'inmcm4',
        'ACCESS1-3',
        'bcc-csm1-1-m',
        'CMCC-CM',
        'HadGEM2-AO',
        'HadGEM2-CC',
        'GISS-E2-R',
        'FGOALS-g2',
        'HadGEM2-ES',
        'CMCC-CMS',
        'GISS-E2-H',
        'CESM1-CAM5',
        'EC-EARTH'
    ]
}
