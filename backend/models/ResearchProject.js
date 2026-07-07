const BaseModel = require('./BaseModel');

class ResearchProject extends BaseModel {
  constructor() {
    super(
      'research_projects',
      [
        'id', 'scholar_id', 'project_title', 'project_description', 
        'research_domain', 'technologies_used', 'major_contributions', 
        'related_publications', 'progress_percentage', 'uploaded_reports', 
        'thesis_status', 'created_at', 'updated_at'
      ],
      ['technologies_used', 'uploaded_reports'] // JSON columns
    );
  }
}

module.exports = new ResearchProject();
