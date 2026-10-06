import { relations } from "drizzle-orm/relations";
import { users, auditLogs, certificates, testObservations, instrumentOwners, instruments, peneraanApplications, pengawasan, pengawasanCerapan, qualityDocuments } from "./schema";

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	auditLogs: many(auditLogs),
	certificates: many(certificates),
	instrumentOwners: many(instrumentOwners),
	instruments: many(instruments),
	peneraanApplications: many(peneraanApplications),
	pengawasans: many(pengawasan),
	qualityDocuments: many(qualityDocuments),
	testObservations: many(testObservations),
}));

export const certificatesRelations = relations(certificates, ({one}) => ({
	user: one(users, {
		fields: [certificates.issuedBy],
		references: [users.id]
	}),
	testObservation: one(testObservations, {
		fields: [certificates.observationId],
		references: [testObservations.id]
	}),
}));

export const testObservationsRelations = relations(testObservations, ({one, many}) => ({
	certificates: many(certificates),
	user: one(users, {
		fields: [testObservations.inspectorId],
		references: [users.id]
	}),
	instrument: one(instruments, {
		fields: [testObservations.instrumentId],
		references: [instruments.id]
	}),
}));

export const instrumentOwnersRelations = relations(instrumentOwners, ({one, many}) => ({
	user: one(users, {
		fields: [instrumentOwners.userId],
		references: [users.id]
	}),
	instruments: many(instruments),
	peneraanApplications: many(peneraanApplications),
}));

export const instrumentsRelations = relations(instruments, ({one, many}) => ({
	instrumentOwner: one(instrumentOwners, {
		fields: [instruments.ownerId],
		references: [instrumentOwners.id]
	}),
	user: one(users, {
		fields: [instruments.registeredBy],
		references: [users.id]
	}),
	peneraanApplications: many(peneraanApplications),
	testObservations: many(testObservations),
}));

export const peneraanApplicationsRelations = relations(peneraanApplications, ({one}) => ({
	instrument: one(instruments, {
		fields: [peneraanApplications.instrumentId],
		references: [instruments.id]
	}),
	instrumentOwner: one(instrumentOwners, {
		fields: [peneraanApplications.ownerId],
		references: [instrumentOwners.id]
	}),
	user: one(users, {
		fields: [peneraanApplications.petugasId],
		references: [users.id]
	}),
}));

export const pengawasanRelations = relations(pengawasan, ({one, many}) => ({
	user: one(users, {
		fields: [pengawasan.petugasId],
		references: [users.id]
	}),
	pengawasanCerapans: many(pengawasanCerapan),
}));

export const pengawasanCerapanRelations = relations(pengawasanCerapan, ({one}) => ({
	pengawasan: one(pengawasan, {
		fields: [pengawasanCerapan.pengawasanId],
		references: [pengawasan.id]
	}),
}));

export const qualityDocumentsRelations = relations(qualityDocuments, ({one}) => ({
	user: one(users, {
		fields: [qualityDocuments.createdBy],
		references: [users.id]
	}),
}));