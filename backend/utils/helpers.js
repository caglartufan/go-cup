exports.firstLetterToUppercase = word => {
    let uppercaseFirstLetter = word.charAt(0).toUpperCase();

    return uppercaseFirstLetter + word.slice(1);
};