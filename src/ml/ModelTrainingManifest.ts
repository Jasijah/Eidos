export interface ModelTrainingManifest {
  manifestVersion: 1;
  createdAt: string;
  schemaVersion: string;
  recordCount: number;
  datasetIds: string[];
  allUsersConsented: boolean;
  allCommerciallyApproved: boolean;
  containsRawMedia: false;
  intendedAlgorithms: Array<'xgboost' | 'lightgbm' | 'tiny-neural-network'>;
}
