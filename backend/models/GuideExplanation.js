const BaseModel = require('./BaseModel');

class GuideExplanation extends BaseModel {
  constructor() {
    super(
      'guide_explanations',
      [
        'id', 'scholar_id', 'guide_name', 'reason_for_delay', 'challenges_faced', 
        'current_progress', 'expected_completion_date', 'additional_remarks', 
        'digital_signature', 'updated_at', 'created_at'
      ]
    );
  }
}

module.exports = new GuideExplanation();
