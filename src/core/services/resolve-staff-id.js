const supabase = require("../config/supabase");

/**
 * Resolves an ID (which can be either an id_user or id_staff) to both:
 * - id_user (for orders.id_staff column)
 * - id_staff (for order_status_history.id_staff column)
 */
exports.resolveStaffIds = async (anyId) => {
  if (!anyId) return { id_user: null, id_staff: null };
  
  // Try mapping assuming anyId is id_staff first
  const { data: byStaff, error: err1 } = await supabase
    .from("staff")
    .select("id_staff, id_user")
    .eq("id_staff", anyId)
    .maybeSingle();
    
  if (!err1 && byStaff) {
    return { id_user: byStaff.id_user, id_staff: byStaff.id_staff };
  }
  
  // Try mapping assuming anyId is id_user
  const { data: byUser, error: err2 } = await supabase
    .from("staff")
    .select("id_staff, id_user")
    .eq("id_user", anyId)
    .maybeSingle();
    
  if (!err2 && byUser) {
    return { id_user: byUser.id_user, id_staff: byUser.id_staff };
  }
  
  // If not found in staff table, it might be an admin user ID, return it as id_user
  return { id_user: anyId, id_staff: null };
};
