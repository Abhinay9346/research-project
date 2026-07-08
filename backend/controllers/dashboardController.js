const db = require('../config/db');

exports.getStats = async (req, res, next) => {
  try {
    const [[{ totalUsers }]] = await db.execute('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalScholars }]] = await db.execute('SELECT COUNT(*) AS totalScholars FROM users WHERE role = "scholar"');
    const [[{ totalGuides }]] = await db.execute('SELECT COUNT(*) AS totalGuides FROM users WHERE role = "guide"');
    const [[{ totalCommitteeMembers }]] = await db.execute('SELECT COUNT(*) AS totalCommitteeMembers FROM users WHERE role = "chairman" OR role = "committee"');
    
    const [[{ totalPublications }]] = await db.execute('SELECT COUNT(*) AS totalPublications FROM publications');
    const [[{ publishedPublications }]] = await db.execute('SELECT COUNT(*) AS publishedPublications FROM publications WHERE status = "published"');
    
    const [[{ totalWeeklyLogs }]] = await db.execute('SELECT COUNT(*) AS totalWeeklyLogs FROM weekly_logs');
    const [[{ approvedWeeklyLogs }]] = await db.execute('SELECT COUNT(*) AS approvedWeeklyLogs FROM weekly_logs WHERE approval_status = "approved"');
    const [[{ pendingWeeklyLogs }]] = await db.execute('SELECT COUNT(*) AS pendingWeeklyLogs FROM weekly_logs WHERE approval_status = "pending"');
    
    const [[{ totalMeetings }]] = await db.execute('SELECT COUNT(*) AS totalMeetings FROM committee_meetings');
    const [[{ completedMeetings }]] = await db.execute('SELECT COUNT(*) AS completedMeetings FROM committee_meetings WHERE status = "completed"');
    const [[{ scheduledMeetings }]] = await db.execute('SELECT COUNT(*) AS scheduledMeetings FROM committee_meetings WHERE status = "scheduled"');
    const [[{ cancelledMeetings }]] = await db.execute('SELECT COUNT(*) AS cancelledMeetings FROM committee_meetings WHERE status = "cancelled"');
    
    const [[{ totalResearchProjects }]] = await db.execute('SELECT COUNT(*) AS totalResearchProjects FROM research_projects');
    const [[{ completedProjects }]] = await db.execute('SELECT COUNT(*) AS completedProjects FROM research_projects WHERE thesis_status = "approved"');
    
    const [[{ guideExplanations }]] = await db.execute('SELECT COUNT(*) AS guideExplanations FROM guide_explanations');
    const [[{ chairmanReviews }]] = await db.execute('SELECT COUNT(*) AS chairmanReviews FROM chairman_reviews');
    const [[{ announcements }]] = await db.execute('SELECT COUNT(*) AS announcements FROM announcements');
    const [[{ totalNotifications }]] = await db.execute('SELECT COUNT(*) AS totalNotifications FROM notifications');
    
    const [[{ departments }]] = await db.execute(`
      SELECT COUNT(DISTINCT department) AS departments
      FROM users
      WHERE department IS NOT NULL
      AND department <> ''
    `);
    
    // Generate dynamic department statistics
    const [departmentRows] = await db.execute(`
      SELECT DISTINCT department
      FROM users
      WHERE department IS NOT NULL AND department <> ''
      ORDER BY department
    `);

    const departmentStats = [];
    const currentYear = new Date().getFullYear();
    for (const row of departmentRows) {
      const dept = row.department;
      
      const [[{ totalScholars }]] = await db.execute(
        'SELECT COUNT(*) AS totalScholars FROM users WHERE role="scholar" AND department=?',
        [dept]
      );
      
      const [[{ totalGuides }]] = await db.execute(
        'SELECT COUNT(*) AS totalGuides FROM users WHERE role="guide" AND department=?',
        [dept]
      );
      
      const [[{ totalPublications }]] = await db.execute(
        'SELECT COUNT(*) AS totalPublications FROM publications p JOIN users u ON p.scholar_id = u.scholar_id WHERE u.department=?',
        [dept]
      );

      const [[{ overdueScholars }]] = await db.execute(
        'SELECT COUNT(*) AS overdueScholars FROM users WHERE role="scholar" AND department=? AND (? - admission_year) >= 4 AND status != "completed"',
        [dept, currentYear]
      );
      
      departmentStats.push({
        code: dept, // UI expects 'code' or name
        name: dept,
        scholarsCount: totalScholars,
        guidesCount: totalGuides,
        publicationsCount: totalPublications,
        overdueScholars: overdueScholars,
        hod: 'Not Assigned' // Default HOD placeholder for UI
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalScholars,
        totalGuides,
        totalCommitteeMembers,
        totalPublications,
        publishedPublications,
        totalWeeklyLogs,
        approvedWeeklyLogs,
        pendingWeeklyLogs,
        totalMeetings,
        completedMeetings,
        scheduledMeetings,
        cancelledMeetings,
        totalResearchProjects,
        completedProjects,
        guideExplanations,
        chairmanReviews,
        announcements,
        totalNotifications,
        departments,
        departmentStats
      }
    });
  } catch (err) {
    next(err);
  }
};
