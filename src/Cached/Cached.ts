import * as dayjs from 'dayjs';

export abstract class Cached {
  protected expiresAt: dayjs.Dayjs;

  constructor(private expirationHours: number = 12) {
    this.expiresAt = dayjs();
  }

  public isActive() {
    return this.expiresAt.isAfter(dayjs());
  }

  public isExpired() {
    return !this.isActive();
  }

  protected refreshExpiration() {
    this.expiresAt = dayjs().add(this.expirationHours, 'h');
  }
}
