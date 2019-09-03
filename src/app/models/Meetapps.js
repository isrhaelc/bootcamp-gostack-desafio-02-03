import Sequelize, { Model } from 'sequelize';
import { isBefore } from 'date-fns';

class Meetapps extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        location: Sequelize.STRING,
        date: Sequelize.DATE,
        editable: {
          type: Sequelize.VIRTUAL,
          get() {
            return !isBefore(this.date, new Date());
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.Subscription, {
      foreignKey: 'meetapp_id',
      as: 'meetapp',
    });
    this.belongsTo(models.File, { foreignKey: 'file_id' });
    this.belongsTo(models.User, { foreignKey: 'user_id' });
  }
}

export default Meetapps;
