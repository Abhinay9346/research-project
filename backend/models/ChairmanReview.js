const BaseModel = require('./BaseModel');

class ChairmanReview extends BaseModel {
  constructor() {
    super(
      'chairman_reviews',
      [
        'id', 'scholar_id', 'observation', 'comments', 'recommendations', 
        'required_actions', 'new_deadline', 'review_status', 'chairman_name', 
        'created_at', 'updated_at'
      ]
    );
  }

  // Override to order by updated_at instead of created_at
  async findAll() {
    return super.findAll('updated_at DESC');
  }
}

module.exports = new ChairmanReview();
