import { User } from "./User"
import { Metric } from "./Metric"
import { MetricValue } from "./MetricValue"
import { Event } from "./Event"
import { EventMetric } from "./EventMetric"
import { Comment } from "./Comment"

// Define associations
User.hasMany(Metric, { foreignKey: "createdBy", as: "createdMetrics" })
User.hasMany(Event, { foreignKey: "createdBy", as: "createdEvents" })
User.hasMany(Comment, { foreignKey: "authorId", as: "comments" })

Metric.belongsTo(User, { foreignKey: "createdBy", as: "creator" })
Metric.hasMany(MetricValue, { foreignKey: "metricId", as: "values" })
Metric.belongsToMany(Event, { through: EventMetric, foreignKey: "metricId", as: "events" })

MetricValue.belongsTo(Metric, { foreignKey: "metricId", as: "metric" })
MetricValue.belongsTo(User, { foreignKey: "createdBy", as: "creator" })

Event.belongsTo(User, { foreignKey: "createdBy", as: "creator" })
Event.belongsToMany(Metric, { through: EventMetric, foreignKey: "eventId", as: "metrics" })
Event.hasMany(Comment, { foreignKey: "eventId", as: "comments" })

EventMetric.belongsTo(Event, { foreignKey: "eventId", as: "event" })
EventMetric.belongsTo(Metric, { foreignKey: "metricId", as: "metric" })

Comment.belongsTo(Event, { foreignKey: "eventId", as: "event" })
Comment.belongsTo(User, { foreignKey: "authorId", as: "author" })

export { User, Metric, MetricValue, Event, EventMetric, Comment }
