import { describe, it, expect } from 'vitest';
import { getDockerHelp, dockerHelpTopics } from '../tools/docker-help.js';

describe('getDockerHelp', () => {
  it('returns a string', () => {
    const result = getDockerHelp({ topic: 'all' });
    expect(typeof result).toBe('string');
  });

  it('contains Docker setup info', () => {
    const result = getDockerHelp({ topic: 'setup' });
    expect(result).toContain('docker-compose');
    expect(result).toContain('app/packages');
  });

  it('contains Docker commands', () => {
    const result = getDockerHelp({ topic: 'commands' });
    expect(result).toContain('docker compose');
    expect(result).toContain('up');
    expect(result).toContain('down');
  });

  it('contains debugging info', () => {
    const result = getDockerHelp({ topic: 'debug' });
    expect(result).toContain('Debug');
    expect(result).toContain('AM_DEBUG_ENABLED');
    expect(result).toContain('dashboard');
  });

  it('contains docker-compose.yml example', () => {
    const result = getDockerHelp({ topic: 'compose' });
    expect(result).toContain('image:');
    expect(result).toContain('automad/automad');
    expect(result).toContain('volumes');
    expect(result).toContain('./app:/app');
  });

  it('returns all topics combined', () => {
    const result = getDockerHelp({ topic: 'all' });
    expect(result).toContain('Setup');
    expect(result).toContain('Commands');
    expect(result).toContain('Debug');
    expect(result).toContain('compose');
    expect(result).toContain('./app:/app');
  });

  it('warns about common mistakes', () => {
    const result = getDockerHelp({ topic: 'compose' });
    expect(result).toContain('VERMEIDEN');
    expect(result).toContain('./app:/app');
  });
});

describe('dockerHelpTopics', () => {
  it('exports the expected topics', () => {
    expect(dockerHelpTopics).toContain('all');
    expect(dockerHelpTopics).toContain('setup');
    expect(dockerHelpTopics).toContain('commands');
    expect(dockerHelpTopics).toContain('debug');
    expect(dockerHelpTopics).toContain('compose');
  });
});
