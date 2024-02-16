export class BreakerOptions {
  constructor(
    public failureThreshold: number,
    public successThreshold: number,
    public timeout: number
  ) {}
}
