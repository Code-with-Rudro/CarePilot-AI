from app.api.dependencies.auth import require_role
from app.core.constants import ROLE_CLINICIAN, ROLE_RECEPTIONIST

require_receptionist = require_role([ROLE_RECEPTIONIST])
require_clinician = require_role([ROLE_CLINICIAN])
