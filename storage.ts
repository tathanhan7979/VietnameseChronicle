await db.insert(settings).values([
    // Existing settings...
    {
      key: 'telegram_bot_token',
      value: '',
      description: 'Token của Telegram Bot để gửi thông báo',
      category: 'notifications',
      displayName: 'Telegram Bot Token',
      inputType: 'text'
    },
    {
      key: 'telegram_chat_id', 
      value: '',
      description: 'Chat ID để nhận thông báo Telegram',
      category: 'notifications', 
      displayName: 'Telegram Chat ID',
      inputType: 'text'
    }
  ]).onConflictDoNothing();