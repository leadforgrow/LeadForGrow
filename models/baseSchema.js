import mongoose from 'mongoose';

/**
 * Standard audit + soft-delete fields for all domain entities.
 * Apply via schema.plugin(baseSchemaPlugin) or spread baseSchemaFields.
 */
export const baseSchemaFields = {
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  deletedAt: {
    type: Date,
    default: null,
    index: true,
  },
  version: {
    type: Number,
    default: 0,
  },
};

/**
 * Mongoose plugin: timestamps + audit fields + soft-delete helpers.
 */
export function baseSchemaPlugin(schema, options = {}) {
  const { timestamps = true, softDelete = true } = options;

  if (timestamps && !schema.options.timestamps) {
    schema.set('timestamps', true);
  }

  schema.add(baseSchemaFields);

  if (softDelete) {
    schema.pre(/^find/, function excludeDeleted() {
      if (this.getOptions().includeDeleted) return;
      this.where({ deletedAt: null });
    });

    schema.methods.softDelete = async function (userId = null) {
      this.deletedAt = new Date();
      if (userId) this.updatedBy = userId;
      return this.save();
    };

    schema.statics.findWithDeleted = function (filter = {}) {
      return this.find(filter).setOptions({ includeDeleted: true });
    };
  }
}

export default baseSchemaPlugin;
