const db = require('../config/db');

class BaseModel {
  constructor(tableName, allowedColumns, jsonColumns = []) {
    this.tableName = tableName;
    this.allowedColumns = allowedColumns;
    this.jsonColumns = jsonColumns;
  }

  _parseRow(row) {
    if (!row) return row;
    const parsed = { ...row };
    for (const col of this.jsonColumns) {
      if (typeof parsed[col] === 'string') {
        try {
          parsed[col] = JSON.parse(parsed[col]);
        } catch (e) {
          // keep as is if parsing fails
        }
      }
    }
    return parsed;
  }

  _stringifyData(data) {
    const formatted = { ...data };
    for (const col of this.jsonColumns) {
      if (formatted[col] !== undefined && typeof formatted[col] !== 'string') {
        formatted[col] = JSON.stringify(formatted[col]);
      }
    }
    return formatted;
  }

  _filterAllowed(data) {
    const filtered = {};
    for (const key of Object.keys(data)) {
      if (this.allowedColumns.includes(key)) {
        filtered[key] = data[key];
      }
    }
    return filtered;
  }

  async findAll(orderBy = 'created_at DESC') {
    try {
      const [rows] = await db.query(`SELECT * FROM ${this.tableName} ORDER BY ${orderBy}`);
      return rows.map(row => this._parseRow(row));
    } catch (error) {
      throw new Error(`Error fetching all from ${this.tableName}: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const [rows] = await db.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
      return rows.length ? this._parseRow(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error fetching by id from ${this.tableName}: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const filteredData = this._filterAllowed(data);
      const formattedData = this._stringifyData(filteredData);
      
      const columns = Object.keys(formattedData);
      if (columns.length === 0) throw new Error('No valid columns provided for insert');
      
      const placeholders = columns.map(() => '?').join(', ');
      const values = Object.values(formattedData);
      
      const [result] = await db.query(
        `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`,
        values
      );
      
      // Attempt to fetch the created record
      // UUID defaults require the ID to be passed from the client, or we return the merged object
      let createdRecord = null;
      if (formattedData.id) {
         createdRecord = await this.findById(formattedData.id);
      } else if (result.insertId) {
         createdRecord = await this.findById(result.insertId);
      }
      
      return createdRecord || { ...formattedData }; 
    } catch (error) {
      throw new Error(`Error creating record in ${this.tableName}: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const filteredData = this._filterAllowed(data);
      delete filteredData.id; // Prevent updating the primary key
      
      const formattedData = this._stringifyData(filteredData);
      const keys = Object.keys(formattedData);
      
      if (keys.length === 0) return null;
      
      const setClause = keys.map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(formattedData), id];
      
      const [result] = await db.query(
        `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`,
        values
      );
      
      if (result.affectedRows === 0) {
        throw new Error(`Record with id ${id} not found in ${this.tableName}`);
      }
      
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating record in ${this.tableName}: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const [result] = await db.query(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
      if (result.affectedRows === 0) {
        throw new Error(`Record with id ${id} not found in ${this.tableName}`);
      }
      return true;
    } catch (error) {
      throw new Error(`Error deleting record in ${this.tableName}: ${error.message}`);
    }
  }
}

module.exports = BaseModel;
