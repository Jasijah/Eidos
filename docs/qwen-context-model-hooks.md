# Qwen Context Model Hooks

Qwen 3 4B is an optional local context hook. It is disabled by default:

```env
VITE_EIDOS_CONTEXT_MODEL_ENABLED=false
```

`LocalQwenProvider` may later connect to an approved local runtime. The Beta does not send private conversation text to a cloud provider. When disabled, Eidos works normally. When enabled without a runtime, it returns a deterministic local fallback label.

Context labels include professional, casual, engaged, confused, thinking, listening, presenting, and low-energy. `ContextToPresenceMapper` converts labels into high-level suggestions. The context model never emits joint rotations, blendshape values, or direct avatar controls.

Before shipping a local runtime, verify the exact model weights and runtime licenses permit the intended commercial distribution and use.
