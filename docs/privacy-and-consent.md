# Privacy and Consent

Eidos is local-first. Default settings are local avatar retention, local behavior-profile retention, no public model training, and no raw media cloud upload.

Users control:

- visual avatar creation consent;
- whether uploaded images are saved locally or discarded after the session;
- whether normalized behavior profiles are saved locally;
- whether they opt in to model improvement;
- deletion of avatar data, behavior memory, or all local Eidos data;
- export of their current Eidos profile as JSON.

Model-improvement opt-in does not authorize raw image, video, or audio upload. A production contribution pipeline would require a separate upload disclosure, dataset agreement, withdrawal mechanism, provenance record, and server-side deletion workflow.

Camera frames used for local training are processed in memory and not stored by the MVP. Microphone audio drives state and lip movement but is not stored or used for voice cloning.
