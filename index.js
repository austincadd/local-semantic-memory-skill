module.exports = {
  id: 'local-semantic-memory',
  name: 'Local Semantic Memory',
  register(api) {
    const logger = api?.logger || console;
    const runtimeConfig = api?.config?.plugins?.entries?.['local-semantic-memory']?.config || {};

    api.registerGatewayMethod?.('localSemanticMemory.status', ({ respond }) => {
      respond(true, {
        ok: true,
        pluginId: 'local-semantic-memory',
        workspaceRoot: runtimeConfig.workspaceRoot || process.env.MEMORY_LOCAL_WORKSPACE || null,
        ollamaHost: runtimeConfig.ollamaHost || process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
        defaultEmbedModel: runtimeConfig.defaultEmbedModel || process.env.MEMORY_LOCAL_EMBED_MODEL || 'nomic-embed-text',
        profilesPath: runtimeConfig.profilesPath || process.env.MEMORY_LOCAL_PROFILES || null
      });
    });

    api.registerCli?.(({ program }) => {
      program
        .command('local-memory-status')
        .description('Show local semantic memory plugin config summary')
        .action(() => {
          const summary = {
            pluginId: 'local-semantic-memory',
            workspaceRoot: runtimeConfig.workspaceRoot || process.env.MEMORY_LOCAL_WORKSPACE || null,
            ollamaHost: runtimeConfig.ollamaHost || process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
            defaultEmbedModel: runtimeConfig.defaultEmbedModel || process.env.MEMORY_LOCAL_EMBED_MODEL || 'nomic-embed-text',
            profilesPath: runtimeConfig.profilesPath || process.env.MEMORY_LOCAL_PROFILES || null
          };
          process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
        });
    }, { commands: ['local-memory-status'] });

    logger.info?.('[local-semantic-memory] plugin registered');
  }
};
