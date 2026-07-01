export default{
  html:(code:string)=>`<body>
<!DOCTYPE html>
<!-- saved from url=(0014)about:internet -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f5f5f5">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="margin: 20px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); font-family: Arial, sans-serif;">
                <!-- Шапка -->
                <tr>
                    <td bgcolor="#508ef4" style="padding: 30px 40px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 20px; line-height: 1.6; font-family: Arial, sans-serif;">
                            SITE_NAME
                        </h1>
                    </td>
                </tr>

                <!-- Основной контент -->
                <tr>
                    <td style="padding: 40px; font-family: Arial, sans-serif;">

                        <p style="font-size: 16px; line-height: 1.5;">Здравствуйте!<br><br>
                        Мы получили запрос на смену пароля для вашего аккаунта на сайте SITE_NAME.</p>

                        <!-- Блок с кодом -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 25px 0; background-color: #f0f6ff; border-left: 4px solid #508ef4; border-radius: 4px;">
                            <tr>
                                <td style="padding: 20px; text-align: center;">
                                    <p style="margin: 0 0 10px; font-size: 16px; line-height: 1.5; color: #333;">
                                        Ваш код для смены пароля:
                                    </p>
                                    <p style="margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #508ef4; font-family: 'Courier New', monospace;">${code}</p>
                                    <p style="margin: 15px 0 0; font-size: 14px; color: #888;">Код действителен в течение 5 минут.</p>
                                </td>
                            </tr>
                        </table>

                        <p style="font-size: 16px; line-height: 1.5;">Введите этот код на странице смены пароля. Если вы не запрашивали смену пароля — просто проигнорируйте это письмо.</p>

                        <!-- Подпись -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 2px solid #508ef4; padding-top: 20px; margin-top: 30px;">
                            <tr>
                                <td align="center">
                                    <p style="color: #f57f2d; font-weight: bold; margin: 0;">Команда SITE_NAME</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <!-- Футер -->
                <tr>
                    <td bgcolor="#f0f0f0" style="padding: 20px; text-align: center; color: #888; font-size: 12px; font-family: Arial, sans-serif;">
                        <p style="margin: 0; color: #888; font-size: 12px;">Вы получили это письмо, так как указали эту почту при регистрации на сайте SITE_NAME.</p>
                    </td>
                </tr>
            </table>
        </table>
    </table>
</table>
</body>`
}
