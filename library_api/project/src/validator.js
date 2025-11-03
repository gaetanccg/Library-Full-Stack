function validateEmail(email) {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) || email.length > 254 || email.length < 1) {
        return false;
    } else {
        return true;
    }
}

function validatePassword(password) {
    if (password.length < 8) {
        return false;
    } else if (!password.match(/[A-Z]/)) {
        return false;
    } else if (!password.match(/\d/)) {
        return false;
    } else {
        return true;
    }
}

function validatePhone(phone) {
    return phone.match(/^[0-9]{10}$/);
}

function validateAge(age) {
    return 18 >= age <= 120;
}

module.exports = {
    validateEmail,
    validatePassword,
    validatePhone,
    validateAge
};
