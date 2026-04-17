export interface IAiProvider {
  generateMockData(
    responseStructure: string,
    itemCount: number,
    aiPrompt?: string,
    isList?: boolean,
    idField?: string,
  ): Promise<unknown>;
}
