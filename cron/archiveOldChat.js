const cron = require('node-cron');
const Chat = require('../models/chat');
const ArchivedChat = require('../models/archivedChat');
const sequelize = require('../util/database');
const { Op } = require('sequelize');

const archiveOldChats = async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find chats older than 1 day
    const oldChats = await Chat.findAll({
      where: {
        createdAt: {
          [Op.lt]: oneDayAgo
        }
      }
    });

    if (!oldChats.length) return;

    // Bulk insert into ArchivedChat
    const archiveData = oldChats.map(chat => chat.toJSON());
    await ArchivedChat.bulkCreate(archiveData);

    // Delete from Chat table
    await Chat.destroy({
      where: {
        createdAt: {
          [Op.lt]: oneDayAgo
        }
      }
    });

    console.log(`Archived ${oldChats.length} old chat(s).`);
  } catch (err) {
    console.error('Error archiving chats:', err);
  }
};

// Run every night at 2am
cron.schedule('0 2 * * *', archiveOldChats);