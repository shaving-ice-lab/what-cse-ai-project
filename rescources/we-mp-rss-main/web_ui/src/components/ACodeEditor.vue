<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as monaco from 'monaco-editor'

// Configure MonacoEnvironment to load Web Workers
self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    if (label === 'json') {
      return './json.worker.bundle.js';
    }
    if (label === 'css') {
      return './css.worker.bundle.js';
    }
    if (label === 'html') {
      return './html.worker.bundle.js';
    }
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.bundle.js';
    }
    return './editor.worker.bundle.js';
  }
};

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'plaintext'
  },
  placeholder: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: '200px'
  }
})

const emit = defineEmits(['update:modelValue'])
const editorRef = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// Define custom language for keyword highlighting
const customLanguage = {
  keywords: ['function', 'if', 'else', 'return', 'let', 'const', 'var'],
  tokenizer: {
    root: [
      [/\b(for|if|else|return|elseif|endif|endfor|const|in)\b/, 'keyword'],
      [/[a-zA-Z_$][\w$]*/, 'identifier'],
      [/\d+/, 'number'],
      [/\/\/.*$/, 'comment'],
      [/\{\%|\%\}|\{|\}/, 'tag'],
      [/\.([a-zA-Z_$][\w$]*)/, 'property'],
    ]
  }
};

// Register custom language
monaco.languages.register({ id: 'custom' });
monaco.languages.setMonarchTokensProvider('custom', customLanguage);

// Set theme for custom language
monaco.editor.defineTheme('customTheme', {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: 'FF0000', fontStyle: 'bold' },
    { token: 'identifier', foreground: '000000' },
    { token: 'tag', foreground: '0000ff' },
    { token: 'number', foreground: '098658' },
    { token: 'comment', foreground: '008000', fontStyle: 'italic' },
    { token: 'property', foreground: '800080', fontStyle: 'bold' },
  ],
  colors: {}
});

// Register completion provider for custom language
monaco.languages.registerCompletionItemProvider('custom', {
  provideCompletionItems: (model, position) => {
    const suggestions = [
      {
        label: 'if',
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: '{% if article %}',
        documentation: 'If statement'
      },
      {
        label: 'endif',
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: '{% endif %}',
        documentation: 'End If statement'
      },
      {
        label: 'else',
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: '{% else %}',
        documentation: 'Else statement'
      },
      {
        label: 'for',
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: '{% for item in articles %}',
        documentation: 'for statement'
      },
      {
        label: 'endfor',
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: '{% endfor %}',
        documentation: 'end for statement'
      },
      {
        label: 'item.title',
        kind: monaco.languages.CompletionItemKind.Property,
        insertText: '{{ item.title }}',
        documentation: 'Article title property'
      },
      {
        label: 'item.content',
        kind: monaco.languages.CompletionItemKind.Property,
        insertText: '{{ item.content }}',
        documentation: 'Article content property'
      },
      {
        label: 'item.publish_time',
        kind: monaco.languages.CompletionItemKind.Property,
        insertText: '{{ item.publish_time }}',
        documentation: 'Article publish_time property'
      },
    ];
    return { suggestions };
  }
});

const initEditor = () => {
  if (!editorRef.value) return

  editor = monaco.editor.create(editorRef.value, {
    value: props.modelValue,
    language: props.language === 'custom' ? 'custom' : props.language,
    theme: props.language === 'custom' ? 'customTheme' : 'vs',
    minimap: { enabled: false },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: true,
    scrollbar: {
      vertical: 'auto',
      horizontal: 'hidden'
    },
    wordWrap: 'on',
    placeholder: props.placeholder
  })

  editor.onDidChangeModelContent(() => {
    const value = editor?.getValue() || ''
    emit('update:modelValue', value)
  })
}

watch(() => props.modelValue, (newValue) => {
  if (editor && editor.getValue() !== newValue) {
    editor.setValue(newValue)
  }
})

watch(() => props.language, (newLanguage) => {
  if (editor) {
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, newLanguage)
    }
  }
})

onMounted(() => {
  initEditor()
})
</script>

<template>
  <div 
    ref="editorRef" 
    class="monaco-editor" 
    :style="{ height: props.height }"
  />
</template>

<style scoped>
.monaco-editor {
  width: 100%;
  min-width: 500px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}
</style>