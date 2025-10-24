from ..models import AdminOtp
from django.core.mail import send_mail

def mail_service(email):
    if not email:
        message = "Email required"
        return False, message
    
    otp = AdminOtp.generate_otp()
    AdminOtp.objects.create(email=email, otp=otp)
    
    send_mail(
        subject="Your Admin Otp",
        message=f"Your OTP is {otp}. It expires in 10 minutes.",
        from_email="no-reply@scango.com",
        recipient_list=["hahahe840@gmail.com"],
    )

    return True, {"message":"OTP sent successfully"}

def otp_verify_service(email, otp):
    if not email or not otp:
        message = "Email and OTP are required"
        return False, message
    
    try:
        otp_enty = AdminOtp.objects.filter(email=email, is_verified = False).latest('created_at')
    except AdminOtp.DoesNotExist:
        message = 'No OTP found'
        return False, message
    
    if otp_enty.is_expired():
        message = 'OTP expired'
        return False, message
    
    if otp_enty.otp != otp:
        message = "Invalid OTP"
        return False, message
    
    otp_enty.is_verified = True
    otp_enty.save()

    message = "OTP Verified"
    return True, message
    
