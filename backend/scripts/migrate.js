import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/config/db.config.js';

// ES 모듈에서 __dirname을 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Database Migration Runner
 * 
 * 데이터베이스 스키마 변경사항을 관리하고 실행하는 마이그레이션 스크립트입니다.
 * migrations 폴더에 있는 SQL 파일들을 순서대로 실행하여 데이터베이스 구조를
 * 최신 상태로 유지합니다. 파일명 순서대로 실행되므로 파일명에 숫자 접두사를
 * 사용하여 실행 순서를 제어할 수 있습니다.
 * 
 * @author ShieldFi Team
 * @version 1.0.0
 * @example
 * // 마이그레이션 실행
 * node scripts/migrate.js
 */
class MigrationRunner {
  /**
   * MigrationRunner 생성자
   * 
   * 마이그레이션 파일들이 위치한 디렉토리 경로를 설정합니다.
   */
  constructor() {
    // migrations 폴더 경로 설정 (scripts 폴더의 상위 디렉토리의 migrations 폴더)
    this.migrationsDir = path.join(__dirname, '..', 'migrations');
  }

  /**
   * 마이그레이션 파일 목록을 가져와서 정렬
   * 
   * migrations 디렉토리에서 .sql 확장자를 가진 모든 파일을 찾아서
   * 파일명 순서대로 정렬하여 반환합니다. 파일명에 숫자 접두사가 있으면
   * 해당 순서대로 실행됩니다.
   * 
   * @returns {Array<string>} 정렬된 마이그레이션 파일 경로 배열
   * 
   * @example
   * // 반환 예시
   * [
   *   '/path/to/migrations/001_create_products_table.sql',
   *   '/path/to/migrations/002_create_insurance_policy_table.sql'
   * ]
   */
  getMigrationFiles() {
    // migrations 디렉토리의 모든 파일 목록을 읽어옴
    const files = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql'))  // .sql 확장자 파일만 필터링
      .sort();  // 파일명 순서대로 정렬
    
    // 각 파일의 전체 경로를 생성하여 반환
    return files.map(file => path.join(this.migrationsDir, file));
  }

  /**
   * 단일 마이그레이션 파일 실행
   * 
   * 지정된 SQL 파일을 읽어서 데이터베이스에 실행합니다.
   * 실행 성공/실패 여부를 반환하며, 실패 시 에러 로그를 출력합니다.
   * 
   * @param {string} filePath - 실행할 마이그레이션 파일의 전체 경로
   * @returns {Promise<boolean>} 실행 성공 여부 (true: 성공, false: 실패)
   * 
   * @example
   * const success = await runner.executeMigration('/path/to/001_create_table.sql');
   * if (success) {
   *   console.log('마이그레이션 성공');
   * }
   */
  async executeMigration(filePath) {
    try {
      // SQL 파일 내용을 UTF-8 인코딩으로 읽어옴
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // 실행 시작 로그 출력
      console.log(`[Migration] Executing: ${path.basename(filePath)}`);
      
      // PostgreSQL 연결 풀을 사용하여 SQL 실행
      await pool.query(sql);
      
      // 실행 성공 로그 출력
      console.log(`[Migration] ✅ Success: ${path.basename(filePath)}`);
      return true;
    } catch (error) {
      // 실행 실패 시 에러 로그 출력
      console.error(`[Migration] ❌ Error in ${path.basename(filePath)}:`, error.message);
      return false;
    }
  }

  /**
   * 모든 마이그레이션 파일을 순서대로 실행
   * 
   * migrations 디렉토리의 모든 SQL 파일을 순서대로 실행합니다.
   * 하나의 파일이라도 실행에 실패하면 전체 프로세스를 중단합니다.
   * 
   * @returns {Promise<boolean>} 전체 마이그레이션 성공 여부
   * 
   * @example
   * const runner = new MigrationRunner();
   * const success = await runner.runMigrations();
   * if (success) {
   *   console.log('모든 마이그레이션이 성공적으로 완료되었습니다.');
   * }
   */
  async runMigrations() {
    console.log('[Migration] Starting database migrations...');
    
    // 마이그레이션 파일 목록 가져오기
    const migrationFiles = this.getMigrationFiles();
    
    // 마이그레이션 파일이 없는 경우
    if (migrationFiles.length === 0) {
      console.log('[Migration] No migration files found');
      return true;
    }

    let allSuccess = true;
    
    // 각 마이그레이션 파일을 순서대로 실행
    for (const filePath of migrationFiles) {
      const success = await this.executeMigration(filePath);
      if (!success) {
        allSuccess = false;
        break; // 첫 번째 실패 시 전체 프로세스 중단
      }
    }

    // 전체 결과 로그 출력
    if (allSuccess) {
      console.log('[Migration] ✅ All migrations completed successfully');
    } else {
      console.log('[Migration] ❌ Migration failed');
    }

    return allSuccess;
  }

  /**
   * 데이터베이스 연결 종료
   * 
   * PostgreSQL 연결 풀의 모든 연결을 종료합니다.
   * 애플리케이션 종료 시 반드시 호출해야 합니다.
   * 
   * @returns {Promise<void>}
   */
  async close() {
    await pool.end();
  }
}

// 스크립트가 직접 실행된 경우 마이그레이션 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new MigrationRunner();
  
  try {
    // 마이그레이션 실행
    const success = await runner.runMigrations();
    
    // 성공 시 exit code 0, 실패 시 exit code 1로 프로세스 종료
    process.exit(success ? 0 : 1);
  } catch (error) {
    // 치명적 에러 발생 시 에러 로그 출력 후 프로세스 종료
    console.error('[Migration] Fatal error:', error);
    process.exit(1);
  } finally {
    // 성공/실패 여부와 관계없이 데이터베이스 연결 종료
    await runner.close();
  }
}

// MigrationRunner 클래스를 기본 내보내기로 설정
export default MigrationRunner;
