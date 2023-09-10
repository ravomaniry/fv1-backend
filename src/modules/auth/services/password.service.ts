import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class PasswordService {
  hashPassword(username: string, password: string) {
    return this.hashString(
      this.combineHashes(this.hashString(username), this.hashString(password)),
    );
  }

  passwordIsWeak(pwd: string): boolean {
    return pwd.length < 8;
  }

  private hashString(str: string): string {
    return createHash('sha256').update(str).update(str).digest('hex');
  }

  private combineHashes(hash1: string, hash2: string) {
    let combined = '';
    for (let i = 0; i < hash1.length; i++) {
      combined += i % 2 == 0 ? hash1[i] : hash2[i];
    }
    return combined;
  }
}
