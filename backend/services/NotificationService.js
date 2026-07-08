const pool = require('../config/db');
const crypto = require('crypto');

class NotificationService {
  /**
   * Send a notification to a specific user
   */
  static async notify({ recipient_user_id, title, message, type = 'info', module = null, record_id = null }) {
    if (!recipient_user_id) return; // Prevent notifying if no specific user

    const id = crypto.randomUUID();
    const query = `
      INSERT INTO notifications 
      (id, recipient_user_id, title, message, type, module, record_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(query, [id, recipient_user_id, title, message, type, module, record_id]);
    return id;
  }

  /**
   * Send identical notifications to multiple users
   */
  static async notifyMultiple({ recipient_user_ids, title, message, type = 'info', module = null, record_id = null }) {
    if (!recipient_user_ids || recipient_user_ids.length === 0) return;

    const values = [];
    const placeholders = [];
    
    recipient_user_ids.forEach(userId => {
      placeholders.push('(?, ?, ?, ?, ?, ?, ?)');
      values.push(crypto.randomUUID(), userId, title, message, type, module, record_id);
    });

    const query = `
      INSERT INTO notifications 
      (id, recipient_user_id, title, message, type, module, record_id) 
      VALUES ${placeholders.join(', ')}
    `;
    await pool.query(query, values);
  }

  /**
   * Mark a notification as read
   */
  static async markRead(notification_id, recipient_user_id) {
    const query = `UPDATE notifications SET is_read = true WHERE id = ? AND recipient_user_id = ?`;
    const [result] = await pool.query(query, [notification_id, recipient_user_id]);
    return result.affectedRows > 0;
  }

  /**
   * Delete a notification
   */
  static async delete(notification_id, recipient_user_id) {
    const query = `DELETE FROM notifications WHERE id = ? AND recipient_user_id = ?`;
    const [result] = await pool.query(query, [notification_id, recipient_user_id]);
    return result.affectedRows > 0;
  }
  
  /**
   * Get notifications for a user
   */
  static async getForUser(recipient_user_id) {
    const query = `
      SELECT * FROM notifications 
      WHERE recipient_user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 100
    `;
    const [rows] = await pool.query(query, [recipient_user_id]);
    return rows;
  }

  /**
   * Helper: Get user IDs by role
   */
  static async getUsersByRole(role) {
    const [rows] = await pool.query(`SELECT id FROM users WHERE role = ?`, [role]);
    return rows.map(r => r.id);
  }

  /**
   * Helper: Get user ID by name (for guide mapping)
   */
  static async getUserIdByName(name) {
    if (!name) return null;
    const [rows] = await pool.query(`SELECT id FROM users WHERE full_name = ? LIMIT 1`, [name]);
    return rows.length > 0 ? rows[0].id : null;
  }

  /**
   * Helper: Get user ID by custom scholar_id
   */
  static async getUserIdByScholarId(scholarId) {
    if (!scholarId) return null;
    const [rows] = await pool.query(`SELECT id FROM users WHERE scholar_id = ? LIMIT 1`, [scholarId]);
    return rows.length > 0 ? rows[0].id : null;
  }

  /**
   * Helper: Get all user IDs
   */
  static async getAllUserIds() {
    const [rows] = await pool.query(`SELECT id FROM users`);
    return rows.map(r => r.id);
  }
}

module.exports = NotificationService;
