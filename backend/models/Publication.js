const BaseModel = require('./BaseModel');

class Publication extends BaseModel {
  constructor() {
    super(
      'publications',
      [
        'id', 'scholar_id', 'scholar_name', 'title', 'doi', 'journal', 
        'conference', 'issn', 'indexing', 'apc_paid', 'journal_link', 
        'status', 'verified', 'published_date', 'created_at'
      ],
      ['indexing'] // JSON columns
    );
  }
}

module.exports = new Publication();
