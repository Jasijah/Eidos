import { TrainingRecordExporter } from '../src/ml/TrainingRecordExporter';
import type { TrainingDatasetRow } from '../src/ml/TrainingDatasetSchema';

export function exportPresenceTrainingData(rows: TrainingDatasetRow[]): { jsonl: string; csv: string; manifest: string } {
  const exporter = new TrainingRecordExporter();
  return { jsonl: exporter.toJsonl(rows), csv: exporter.toCsv(rows), manifest: JSON.stringify(exporter.manifest(rows), null, 2) };
}

// This module intentionally performs no filesystem writes. A reviewed CLI wrapper can
// provide destinations after consent, license manifests, and retention controls are configured.
