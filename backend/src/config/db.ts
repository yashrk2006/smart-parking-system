import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve(__dirname, '../../smart_parking.db');
const SCHEMA_PATH = path.resolve(__dirname, 'schema.sql');
const SEED_PATH = path.resolve(__dirname, 'seed.sql');

let db: Database.Database;

function initDB() {
    const isNew = !fs.existsSync(DB_PATH);
    db = new Database(DB_PATH);

    // Enable WAL mode for better concurrent reads
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    if (isNew) {
        console.log('🗄️  Creating new database...');

        // Run schema
        const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
        db.exec(schema);
        console.log('✅ Schema created');

        // Run seed data
        const seed = fs.readFileSync(SEED_PATH, 'utf-8');
        db.exec(seed);
        console.log('✅ Seed data inserted');
    } else {
        console.log('🗄️  Database loaded from', DB_PATH);
    }

    return db;
}

// Initialize on import
initDB();

/**
 * Query wrapper that mimics the pg Pool interface for route compatibility.
 * Converts PostgreSQL-style $1, $2 params to ? for SQLite.
 */
export const query = async (text: string, params?: any[]) => {
    try {
        // Convert PostgreSQL $1, $2 style to ? for SQLite
        let sqliteText = text;
        if (params && params.length > 0) {
            for (let i = params.length; i >= 1; i--) {
                sqliteText = sqliteText.replace(new RegExp(`\\$${i}`, 'g'), '?');
            }
        }

        // Replace PostgreSQL functions with SQLite equivalents
        sqliteText = sqliteText.replace(/\bNOW\(\)/gi, "datetime('now')");
        sqliteText = sqliteText.replace(/\bCURRENT_DATE\b/gi, "date('now')");

        // Determine statement type
        const trimmed = sqliteText.trim().toUpperCase();
        const isSelect = trimmed.startsWith('SELECT');
        const hasReturning = trimmed.includes('RETURNING');

        if (isSelect) {
            const rows = db.prepare(sqliteText).all(...(params || []));
            return { rows, rowCount: rows.length };
        } else if (hasReturning) {
            // SQLite doesn't support RETURNING — run statement then fetch
            const withoutReturning = sqliteText.replace(/\s*RETURNING\s+\*/i, '');
            const info = db.prepare(withoutReturning).run(...(params || []));

            // For INSERT, get the last inserted row
            if (trimmed.startsWith('INSERT')) {
                // Extract table name
                const tableMatch = sqliteText.match(/INTO\s+(\w+)/i);
                if (tableMatch) {
                    const rows = db.prepare(`SELECT * FROM ${tableMatch[1]} WHERE rowid = ?`).all(info.lastInsertRowid);
                    return { rows, rowCount: rows.length };
                }
            }
            // For UPDATE, re-fetch using the first param (usually the id)
            if (trimmed.startsWith('UPDATE') && params && params.length > 0) {
                const tableMatch = sqliteText.match(/UPDATE\s+(\w+)/i);
                if (tableMatch) {
                    const rows = db.prepare(`SELECT * FROM ${tableMatch[1]} WHERE id = ?`).all(params[0]);
                    return { rows, rowCount: rows.length };
                }
            }
            return { rows: [], rowCount: info.changes };
        } else {
            const info = db.prepare(sqliteText).run(...(params || []));
            return { rows: [], rowCount: info.changes };
        }
    } catch (error) {
        console.error('Database Error:', error);
        return { rows: [], rowCount: 0 };
    }
};

export const getDB = () => db;
