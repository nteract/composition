declare module "uuid" {
  declare function v1(
    options?: {|
      node?: number[],
      clockseq?: number,
      msecs?: number | Date,
      nsecs?: number
    |},
    buffer?: number[] | Buffer,
    offset?: number
  ): string;
  declare function v4(
    options?: {|
      random?: number[],
      rng?: () => number[] | Buffer
    |},
    buffer?: number[] | Buffer,
    offset?: number
  ): string;
}
