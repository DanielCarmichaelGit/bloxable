// Configuration validation utilities

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export function validateConfiguration(configData: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields validation
  if (!configData.platform) {
    errors.push({
      field: "platform",
      message: "Platform is required",
    });
  }

  if (!configData.trigger_type) {
    errors.push({
      field: "trigger_type",
      message: "Trigger type is required",
    });
  }

  // Webhook configuration validation (always required)
  if (!configData.trigger_config?.webhook_url) {
    errors.push({
      field: "webhook_url",
      message: "Webhook URL is required",
    });
  } else {
    // Validate webhook URL format
    try {
      new URL(configData.trigger_config.webhook_url);
    } catch {
      errors.push({
        field: "webhook_url",
        message: "Webhook URL must be a valid URL",
      });
    }
  }

  if (!configData.trigger_config?.webhook_method) {
    errors.push({
      field: "webhook_method",
      message: "Webhook method is required",
    });
  }

  // Connection keys validation
  if (configData.connection_keys && Array.isArray(configData.connection_keys)) {
    configData.connection_keys.forEach((key: any, index: number) => {
      if (!key.name || key.name.trim() === "") {
        errors.push({
          field: `connection_keys[${index}].name`,
          message: "Connection key name is required",
        });
      }

      if (!key.description || key.description.trim() === "") {
        errors.push({
          field: `connection_keys[${index}].description`,
          message: "Connection key description is required",
        });
      } else if (key.description.length < 50) {
        errors.push({
          field: `connection_keys[${index}].description`,
          message: "Connection key description must be at least 50 characters",
        });
      } else if (key.description.length > 250) {
        errors.push({
          field: `connection_keys[${index}].description`,
          message:
            "Connection key description must be no more than 250 characters",
        });
      }

      if (!key.type) {
        errors.push({
          field: `connection_keys[${index}].type`,
          message: "Connection key type is required",
        });
      }

      // Validate steps if provided
      if (key.steps && Array.isArray(key.steps)) {
        key.steps.forEach((step: any, stepIndex: number) => {
          if (!step.title || step.title.trim() === "") {
            errors.push({
              field: `connection_keys[${index}].steps[${stepIndex}].title`,
              message: "Step title is required",
            });
          }

          if (!step.description || step.description.trim() === "") {
            errors.push({
              field: `connection_keys[${index}].steps[${stepIndex}].description`,
              message: "Step description is required",
            });
          }
        });
      }
    });
  }

  // Environment variables validation
  if (
    configData.environment_variables &&
    Array.isArray(configData.environment_variables)
  ) {
    configData.environment_variables.forEach((envVar: any, index: number) => {
      if (!envVar.name || envVar.name.trim() === "") {
        errors.push({
          field: `environment_variables[${index}].name`,
          message: "Environment variable name is required",
        });
      }

      if (!envVar.description || envVar.description.trim() === "") {
        errors.push({
          field: `environment_variables[${index}].description`,
          message: "Environment variable description is required",
        });
      }
    });
  }

  // Retry configuration validation
  if (configData.retry_config) {
    if (
      typeof configData.retry_config.max_retries !== "number" ||
      configData.retry_config.max_retries < 0
    ) {
      errors.push({
        field: "retry_config.max_retries",
        message: "Max retries must be a non-negative number",
      });
    }

    if (
      typeof configData.retry_config.retry_delay !== "number" ||
      configData.retry_config.retry_delay < 0
    ) {
      errors.push({
        field: "retry_config.retry_delay",
        message: "Retry delay must be a non-negative number",
      });
    }

    if (configData.retry_config.debounce_enabled) {
      if (
        typeof configData.retry_config.debounce_value !== "number" ||
        configData.retry_config.debounce_value < 1
      ) {
        errors.push({
          field: "retry_config.debounce_value",
          message: "Debounce value must be at least 1",
        });
      }

      if (
        !["seconds", "minutes", "hours", "days"].includes(
          configData.retry_config.debounce_unit
        )
      ) {
        errors.push({
          field: "retry_config.debounce_unit",
          message:
            "Debounce unit must be one of: seconds, minutes, hours, days",
        });
      }
    }
  }

  // Execution timeout validation
  if (
    configData.execution_timeout &&
    (typeof configData.execution_timeout !== "number" ||
      configData.execution_timeout < 1)
  ) {
    errors.push({
      field: "execution_timeout",
      message: "Execution timeout must be a positive number",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function getFieldDisplayName(field: string): string {
  const fieldMap: Record<string, string> = {
    platform: "Platform",
    trigger_type: "Trigger Type",
    webhook_url: "Webhook URL",
    webhook_method: "Webhook Method",
    "connection_keys[].name": "Connection Key Name",
    "connection_keys[].description": "Connection Key Description",
    "connection_keys[].type": "Connection Key Type",
    "connection_keys[].steps[].title": "Step Title",
    "connection_keys[].steps[].description": "Step Description",
    "environment_variables[].name": "Environment Variable Name",
    "environment_variables[].description": "Environment Variable Description",
    "retry_config.max_retries": "Max Retries",
    "retry_config.retry_delay": "Retry Delay",
    "retry_config.debounce_value": "Debounce Value",
    "retry_config.debounce_unit": "Debounce Unit",
    execution_timeout: "Execution Timeout",
  };

  return fieldMap[field] || field;
}
