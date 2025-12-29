package logger

import (
	"os"
	"path/filepath"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

type Logger struct {
	*zap.Logger
}

type Config struct {
	Level      string `mapstructure:"level"`
	Format     string `mapstructure:"format"`
	OutputPath string `mapstructure:"output_path"`
	MaxSize    int    `mapstructure:"max_size"`
	MaxBackups int    `mapstructure:"max_backups"`
	MaxAge     int    `mapstructure:"max_age"`
	Compress   bool   `mapstructure:"compress"`
}

func DefaultConfig() Config {
	return Config{
		Level:      "info",
		Format:     "json",
		OutputPath: "",
		MaxSize:    100,
		MaxBackups: 5,
		MaxAge:     30,
		Compress:   true,
	}
}

func New(level string, format string) (*Logger, error) {
	config := DefaultConfig()
	config.Level = level
	config.Format = format
	return NewWithConfig(config)
}

func NewWithConfig(config Config) (*Logger, error) {
	var zapLevel zapcore.Level
	if err := zapLevel.UnmarshalText([]byte(config.Level)); err != nil {
		zapLevel = zapcore.InfoLevel
	}

	encoderConfig := zap.NewProductionEncoderConfig()
	encoderConfig.TimeKey = "timestamp"
	encoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	encoderConfig.LevelKey = "level"
	encoderConfig.MessageKey = "message"
	encoderConfig.CallerKey = "caller"
	encoderConfig.StacktraceKey = "stacktrace"

	var encoder zapcore.Encoder
	if config.Format == "console" {
		encoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
		encoder = zapcore.NewConsoleEncoder(encoderConfig)
	} else {
		encoder = zapcore.NewJSONEncoder(encoderConfig)
	}

	var cores []zapcore.Core

	consoleCore := zapcore.NewCore(
		encoder,
		zapcore.AddSync(os.Stdout),
		zapLevel,
	)
	cores = append(cores, consoleCore)

	if config.OutputPath != "" {
		fileCore, err := createFileCore(config, encoder, zapLevel)
		if err != nil {
			return nil, err
		}
		cores = append(cores, fileCore)
	}

	core := zapcore.NewTee(cores...)
	logger := zap.New(core, zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel))

	return &Logger{logger}, nil
}

func createFileCore(config Config, encoder zapcore.Encoder, level zapcore.Level) (zapcore.Core, error) {
	if err := os.MkdirAll(filepath.Dir(config.OutputPath), 0755); err != nil {
		return nil, err
	}

	lumberjackLogger := &lumberjack.Logger{
		Filename:   config.OutputPath,
		MaxSize:    config.MaxSize,
		MaxBackups: config.MaxBackups,
		MaxAge:     config.MaxAge,
		Compress:   config.Compress,
		LocalTime:  true,
	}

	return zapcore.NewCore(
		encoder,
		zapcore.AddSync(lumberjackLogger),
		level,
	), nil
}

func NewWithFileOutput(level, format, outputPath string) (*Logger, error) {
	config := DefaultConfig()
	config.Level = level
	config.Format = format
	config.OutputPath = outputPath
	return NewWithConfig(config)
}

func NewWithRotation(level, format, outputPath string, maxSize, maxBackups, maxAge int, compress bool) (*Logger, error) {
	config := Config{
		Level:      level,
		Format:     format,
		OutputPath: outputPath,
		MaxSize:    maxSize,
		MaxBackups: maxBackups,
		MaxAge:     maxAge,
		Compress:   compress,
	}
	return NewWithConfig(config)
}

func (l *Logger) WithField(key string, value interface{}) *Logger {
	return &Logger{l.With(zap.Any(key, value))}
}

func (l *Logger) WithFields(fields map[string]interface{}) *Logger {
	zapFields := make([]zap.Field, 0, len(fields))
	for k, v := range fields {
		zapFields = append(zapFields, zap.Any(k, v))
	}
	return &Logger{l.With(zapFields...)}
}

func (l *Logger) WithError(err error) *Logger {
	return &Logger{l.With(zap.Error(err))}
}

func (l *Logger) WithDuration(d time.Duration) *Logger {
	return &Logger{l.With(zap.Duration("duration", d))}
}

func (l *Logger) WithRequestID(requestID string) *Logger {
	return &Logger{l.With(zap.String("request_id", requestID))}
}

func (l *Logger) WithUserID(userID uint) *Logger {
	return &Logger{l.With(zap.Uint("user_id", userID))}
}
