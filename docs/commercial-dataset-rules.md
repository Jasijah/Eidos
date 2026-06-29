# Commercial Dataset Rules

All production training data is fail-closed.

A record may be exported only when:

- the user explicitly opted in;
- the dataset is registered;
- commercial use is explicitly allowed;
- production training approval is true;
- no raw images, video, or audio are present;
- the user identifier is anonymized.

Unknown licenses are rejected. Non-commercial and research-only data are blocked from production exports. Research-only data may be evaluated only in isolated experimental workflows and cannot produce production artifacts or claims.

The bundled production-approved source is Eidos-owned synthetic behavior fixtures. Real commercial datasets require authoritative license snapshots, provenance manifests, biometric/privacy review, representation evaluation, and written legal approval.
