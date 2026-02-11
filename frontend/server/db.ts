import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, 'smart_parking.db');
const SCHEMA_PATH = path.resolve(__dirname, 'schema.sql');
const SEED_PATH = path.resolve(__dirname, 'seed.sql');

let db: Database.Database;

export function initDB() {
    if (db) return db;

    const isNew = !fs.existsSync(DB_PATH);
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    if (isNew) {
        console.log('🗄️  Creating new database...');
        db.exec(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
        console.log('✅ Schema created');
        db.exec(fs.readFileSync(SEED_PATH, 'utf-8'));
        console.log('✅ Seed data inserted');
    } else {
        console.log('🗄️  Database loaded');
    }

    return db;
}

export function query(text: string, params?: any[]) {
    if (!db) initDB();

    let sql = text;
    if (params && params.length > 0) {
        for (let i = params.length; i >= 1; i--) {
            sql = sql.replace(new RegExp(`\\$${i}`, 'g'), '?');
        }
    }
    sql = sql.replace(/\bNOW\(\)/gi, "datetime('now')");
    sql = sql.replace(/\bCURRENT_DATE\b/gi, "date('now')");

    const trimmed = sql.trim().toUpperCase();
    const isSelect = trimmed.startsWith('SELECT');

    try {
        if (isSelect) {
            const rows = db.prepare(sql).all(...(params || []));
            return { rows, rowCount: rows.length };
        } else {
            const info = db.prepare(sql).run(...(params || []));
            // For INSERT, try to return the inserted row
            if (trimmed.startsWith('INSERT')) {
                const tableMatch = sql.match(/INTO\s+(\w+)/i);
                if (tableMatch) {
                    const rows = db.prepare(`SELECT * FROM ${tableMatch[1]} WHERE rowid = ?`).all(info.lastInsertRowid);
                    return { rows, rowCount: rows.length };
                }
            }
            return { rows: [], rowCount: info.changes };
        }
    } catch (error) {
        console.error('DB Error:', error);
        return { rows: [], rowCount: 0 };
    }
}
