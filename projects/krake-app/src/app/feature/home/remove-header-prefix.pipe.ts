import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "removeHeaderPrefix",
    standalone: true
})
export class RemoveHeaderPrefixPipe implements PipeTransform {
    transform(value: string, prefix: string): string {
        const regex = new RegExp(`${prefix}`);
        const result = value.replace(regex, "");
        return result.trim();
    }
}
