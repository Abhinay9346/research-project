const BaseModel = require('./BaseModel');

class WeeklyLog extends BaseModel {
  constructor() {
    super(
      'weekly_logs',
      [
        'id', 'scholar_id', 'scholar_name', 'guide_id', 'week_date', 
        'research_work', 'hours_worked', 'problems_faced', 'future_plan', 
        'approval_status', 'guide_comment', 'submitted_at', 'reviewed_at', 'created_at'
      ]
    );
  }
}

module.exports = new WeeklyLog();
