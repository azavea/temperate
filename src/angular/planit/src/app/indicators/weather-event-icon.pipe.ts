import { Pipe, PipeTransform } from '@angular/core';
import { WeatherEvent } from '../shared/models/weather-event.model';

// TODO (#252): Remove this when we come up with a better way to match icons to WeatherEvents

@Pipe({
  name: 'weatherEventIcon'
})
export class WeatherEventIconPipe implements PipeTransform {
  transform(value: string): string {
    const v = value.toLocaleLowerCase();
    if (v.match(/hot|heat|cooling|high/)) {
        return 'icon-sun';
    } else if (v.match(/frost|low|freezing/)) {
        return 'icon-snowflake-o';
    } else if (v.match(/temp/)) {
        return 'icon-thermometer';
    } else if (v.match(/precip/)) {
        return 'icon-tint';
    } else if (v.match(/dry/)) {
        return 'icon-cloud';
    } else if (v.match(/hurricane/)) {
        return 'icon-superpowers';
    } else {
        return 'icon-help';
    }
  }
}
