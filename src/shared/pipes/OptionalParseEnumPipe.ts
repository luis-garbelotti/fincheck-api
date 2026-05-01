import { ArgumentMetadata, ParseEnumPipe } from "@nestjs/common";

export class OptionalParseEnumPipe extends ParseEnumPipe {
  override async transform(value: string, metadata: ArgumentMetadata) {
    if (typeof value == 'undefined') {
      return undefined;
    }

    return super.transform(value, metadata);
  }
}