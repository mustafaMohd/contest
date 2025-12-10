import {IsNotEmpty } from 'class-validator';

/**
 * Logout Paylaod Class
 */
export class LogoutPayload {
  /**
   * Refresh Token field
   */

  @IsNotEmpty()
  refreshToken: string;
}
