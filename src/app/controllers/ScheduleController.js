import { Op } from 'sequelize';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

import User from '../models/User';
import Meetapps from '../models/Meetapps';
import File from '../models/File';

class ScheduleController {
  async index(req, res) {
    const where = {};
    const page = req.query.page || 1;

    if (req.query.date) {
      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetapp = await Meetapps.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ['name', 'email'],
        },
        {
          model: File,
          attributes: ['url', 'name', 'path'],
        },
      ],
      attributes: ['id', 'title', 'description', 'location', 'date'],
      limit: 10,
      offset: 10 * page - 10,
    });

    return res.json(meetapp);
  }
}

export default new ScheduleController();
