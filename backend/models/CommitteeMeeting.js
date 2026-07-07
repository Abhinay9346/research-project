const BaseModel = require('./BaseModel');

class CommitteeMeeting extends BaseModel {
  constructor() {
    super(
      'committee_meetings',
      [
        'id', 'scholar_id', 'scholar_name', 'title', 'meeting_date', 
        'meeting_time', 'status', 'agenda', 'minutes', 'recommendations', 
        'attendees', 'created_at'
      ],
      ['attendees'] // JSON columns
    );
  }

  // Override to order by meeting_date ascending instead of created_at descending
  async findAll() {
    return super.findAll('meeting_date ASC');
  }
}

module.exports = new CommitteeMeeting();
