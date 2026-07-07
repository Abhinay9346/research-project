const BaseModel = require('./BaseModel');

class Announcement extends BaseModel {
  constructor() {
    super(
      'announcements',
      ['id', 'title', 'content', 'priority', 'author', 'created_at']
    );
  }
}

module.exports = new Announcement();
