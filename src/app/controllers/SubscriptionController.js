import { Op } from 'sequelize';
import User from '../models/User';
import Meetapps from '../models/Meetapps';
import Subscription from '../models/Subscription';
// import Queue from '../../lib/Queue';
// import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetapps,
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          required: true,
        },
      ],
      order: [[Meetapps, 'date']],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const user = await User.findByPk(req.userId);
    const meetapp = await Meetapps.findByPk(req.params.meetupId, {
      include: [User],
    });

    if (meetapp.user_id === req.userId) {
      return res
        .status(400)
        .json({ error: "Can't subscribe to you own meetups" });
    }

    if (!meetapp.editable) {
      return res.status(400).json({ error: "Can't subscribe to past meetups" });
    }

    const checkDate = await Subscription.findOne({
      where: {
        user_id: user.id,
      },
      include: [
        {
          model: Meetapps,
          required: true,
          where: {
            date: meetapp.date,
          },
        },
      ],
    });

    if (checkDate) {
      return res
        .status(400)
        .json({ error: "Can't subscribe to two meetups at the same time" });
    }

    const subscription = await Subscription.create({
      user_id: user.id,
      meetapp_id: meetapp.id,
    });

    /*
    await Queue.add(SubscriptionMail.key, {
      meetapp,
      user,
    }); */

    return res.json(subscription);
  }
}

export default new SubscriptionController();
