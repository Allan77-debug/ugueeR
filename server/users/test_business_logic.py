from django.test import TestCase
from django.contrib.auth.hashers import make_password, check_password
from users.models import Users
from institutions.models import Institution


class UsersBusinessLogicTest(TestCase):
    """Test cases for business logic and user workflows."""
    
    def setUp(self):
        """Set up test data."""
        self.institution = Institution.objects.create(
            id_institution=1,
            official_name="Test University",
            email="university.edu"
        )
        
        # Create different types of users for testing
        self.student = Users.objects.create(
            full_name="Student User",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="student@university.edu",
            student_code="2023008",
            udocument="88888888",
            direction="888 Student Street",
            uphone="+8888888888",
            upassword=make_password("studentpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_NONE
        )
        
        self.driver = Users.objects.create(
            full_name="Driver User",
            user_type=Users.TYPE_DRIVER,
            institutional_mail="driver@university.edu",
            student_code="2023009",
            udocument="99999999",
            direction="999 Driver Street",
            uphone="+9999999999",
            upassword=make_password("driverpass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_APPROVED
        )
    
    def test_user_approval_workflow(self):
        """Test the user approval workflow."""
        # Create a pending user
        pending_user = Users.objects.create(
            full_name="Pending User",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="pending@university.edu",
            student_code="2023010",
            udocument="10101010",
            direction="101 Pending Street",
            uphone="+1010101010",
            upassword=make_password("pendingpass123"),
            institution=self.institution,
            user_state=Users.STATE_PENDING,
            driver_state=Users.DRIVER_STATE_NONE
        )
        
        # Test initial state
        self.assertEqual(pending_user.user_state, Users.STATE_PENDING)
        self.assertEqual(pending_user.driver_state, Users.DRIVER_STATE_NONE)
        
        # Approve the user
        pending_user.user_state = Users.STATE_APPROVED
        pending_user.save()
        
        # Test approved state
        pending_user.refresh_from_db()
        self.assertEqual(pending_user.user_state, Users.STATE_APPROVED)
        
        # Apply for driver status
        pending_user.driver_state = Users.DRIVER_STATE_PENDING
        pending_user.save()
        
        # Test driver application state
        pending_user.refresh_from_db()
        self.assertEqual(pending_user.driver_state, Users.DRIVER_STATE_PENDING)
    
    def test_driver_application_requirements(self):
        """Test that only approved users can apply to be drivers."""
        # Test that approved user can apply
        self.assertEqual(self.student.user_state, Users.STATE_APPROVED)
        self.assertEqual(self.student.driver_state, Users.DRIVER_STATE_NONE)
        
        # Apply for driver status
        self.student.driver_state = Users.DRIVER_STATE_PENDING
        self.student.save()
        
        self.student.refresh_from_db()
        self.assertEqual(self.student.driver_state, Users.DRIVER_STATE_PENDING)
    
    def test_user_type_validation(self):
        """Test that user types are properly validated."""
        valid_types = [choice[0] for choice in Users.USER_TYPE_CHOICES]
        
        # Test that all user types are valid
        self.assertIn(Users.TYPE_STUDENT, valid_types)
        self.assertIn(Users.TYPE_DRIVER, valid_types)
        self.assertIn(Users.TYPE_EMPLOYEE, valid_types)
        self.assertIn(Users.TYPE_TEACHER, valid_types)
        self.assertIn(Users.TYPE_ADMIN, valid_types)
    
    def test_institution_relationship(self):
        """Test the relationship between users and institutions."""
        # Test that users belong to institutions
        self.assertEqual(self.student.institution, self.institution)
        self.assertEqual(self.driver.institution, self.institution)
        
        # Test institution can access its users
        institution_users = self.institution.members.all()
        self.assertIn(self.student, institution_users)
        self.assertIn(self.driver, institution_users)
    
    def test_password_security(self):
        """Test password security features."""
        # Test that passwords are hashed
        self.assertTrue(check_password("studentpass123", self.student.upassword))
        self.assertFalse(check_password("wrongpassword", self.student.upassword))
        
        # Test that raw passwords are not stored
        self.assertNotEqual("studentpass123", self.student.upassword)
    
    def test_user_state_transitions(self):
        """Test all possible user state transitions."""
        # Test pending -> approved -> rejected
        user = Users.objects.create(
            full_name="State Test User",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="state@university.edu",
            student_code="2023012",
            udocument="12121212",
            direction="121 State Street",
            uphone="+1212121212",
            upassword=make_password("statepass123"),
            institution=self.institution,
            user_state=Users.STATE_PENDING,
            driver_state=Users.DRIVER_STATE_NONE
        )
        
        # Pending -> Approved
        user.user_state = Users.STATE_APPROVED
        user.save()
        self.assertEqual(user.user_state, Users.STATE_APPROVED)
        
        # Approved -> Rejected
        user.user_state = Users.STATE_REJECTED
        user.save()
        self.assertEqual(user.user_state, Users.STATE_REJECTED)
        
        # Rejected -> Approved
        user.user_state = Users.STATE_APPROVED
        user.save()
        self.assertEqual(user.user_state, Users.STATE_APPROVED)
    
    def test_driver_state_transitions(self):
        """Test all possible driver state transitions."""
        # Test none -> pending -> approved -> rejected
        user = Users.objects.create(
            full_name="Driver State Test User",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="driverstate@university.edu",
            student_code="2023013",
            udocument="13131313",
            direction="131 Driver State Street",
            uphone="+1313131313",
            upassword=make_password("driverstatepass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_NONE
        )
        
        # None -> Pending
        user.driver_state = Users.DRIVER_STATE_PENDING
        user.save()
        self.assertEqual(user.driver_state, Users.DRIVER_STATE_PENDING)
        
        # Pending -> Approved
        user.driver_state = Users.DRIVER_STATE_APPROVED
        user.save()
        self.assertEqual(user.driver_state, Users.DRIVER_STATE_APPROVED)
        
        # Approved -> Rejected
        user.driver_state = Users.DRIVER_STATE_REJECTED
        user.save()
        self.assertEqual(user.driver_state, Users.DRIVER_STATE_REJECTED)
        
        # Rejected -> Pending
        user.driver_state = Users.DRIVER_STATE_PENDING
        user.save()
        self.assertEqual(user.driver_state, Users.DRIVER_STATE_PENDING)
    
    def test_user_type_consistency(self):
        """Test that user types are consistent across the system."""
        # Test that user types match their roles
        self.assertEqual(self.student.user_type, Users.TYPE_STUDENT)
        self.assertEqual(self.driver.user_type, Users.TYPE_DRIVER)
        
        # Test that user types are properly stored and retrieved
        student_from_db = Users.objects.get(uid=self.student.uid)
        driver_from_db = Users.objects.get(uid=self.driver.uid)
        
        self.assertEqual(student_from_db.user_type, Users.TYPE_STUDENT)
        self.assertEqual(driver_from_db.user_type, Users.TYPE_DRIVER)
    
    def test_institution_user_count(self):
        """Test that institution user counts are accurate."""
        # Create additional users for the same institution
        Users.objects.create(
            full_name="Extra User 1",
            user_type=Users.TYPE_STUDENT,
            institutional_mail="extra1@university.edu",
            student_code="2023014",
            udocument="14141414",
            direction="141 Extra Street",
            uphone="+1414141414",
            upassword=make_password("extrapass123"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_NONE
        )
        
        Users.objects.create(
            full_name="Extra User 2",
            user_type=Users.TYPE_EMPLOYEE,
            institutional_mail="extra2@university.edu",
            student_code="2023015",
            udocument="15151515",
            direction="151 Extra Street",
            uphone="+1515151515",
            upassword=make_password("extrapass456"),
            institution=self.institution,
            user_state=Users.STATE_APPROVED,
            driver_state=Users.DRIVER_STATE_NONE
        )
        
        # Test that institution has the correct number of users
        institution_users = self.institution.members.all()
        self.assertEqual(institution_users.count(), 4)  # student, driver, extra1, extra2 