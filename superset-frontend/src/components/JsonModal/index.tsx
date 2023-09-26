/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import JSONbig from 'json-bigint';
import React, { useCallback } from 'react';
import { JSONTree } from 'react-json-tree';
import { useTheme } from '@superset-ui/core';
import Button from '../Button';
import CopyToClipboard from '../CopyToClipboard';
import ModalTrigger from '../ModalTrigger';

export function safeJsonObjectParse(
  data: unknown,
): null | unknown[] | Record<string, unknown> {
  // First perform a cheap proxy to avoid calling JSON.parse on data that is clearly not a
  // JSON object or array
  if (
    typeof data !== 'string' ||
    ['{', '['].indexOf(data.substring(0, 1)) === -1
  ) {
    return null;
  }

  // We know `data` is a string starting with '{' or '[', so try to parse it as a valid object
  try {
    const jsonData = JSONbig({ storeAsString: true }).parse(data);
    if (jsonData && typeof jsonData === 'object') {
      return jsonData;
    }
    return null;
  } catch (_) {
    return null;
  }
}

export function convertBigIntStrToNumber(value: string | number) {
  if (typeof value === 'string' && /^"-?\d+"$/.test(value)) {
    return value.substring(1, value.length - 1);
  }
  return value;
}

function renderBigIntStrToNumber(value: string | number) {
  return <>{convertBigIntStrToNumber(value)}</>;
}

type CellDataType = string | number | null;

export interface Props {
  modalTitle: string;
  jsonObject: Record<string, unknown> | unknown[];
  jsonValue: CellDataType;
}

const JsonModal: React.FC<Props> = ({ modalTitle, jsonObject, jsonValue }) => {
  const theme = useTheme();
  const getJsonTreeTheme = useCallback(
    () => ({
      base00: theme.colors.grayscale.dark2,
      base01: theme.colors.grayscale.dark1,
      base02: theme.colors.grayscale.base,
      base03: theme.colors.grayscale.light1,
      base04: theme.colors.grayscale.light2,
      base05: theme.colors.grayscale.light3,
      base06: theme.colors.grayscale.light4,
      base07: theme.colors.grayscale.light5,
      base08: theme.colors.error.base,
      base09: theme.colors.error.light1,
      base0A: theme.colors.error.light2,
      base0B: theme.colors.success.base,
      base0C: theme.colors.primary.light1,
      base0D: theme.colors.primary.base,
      base0E: theme.colors.primary.dark1,
      base0F: theme.colors.error.dark1,
    }),
    [theme],
  );

  return (
    <ModalTrigger
      modalBody={
        <JSONTree
          data={jsonObject}
          theme={getJsonTreeTheme()}
          valueRenderer={renderBigIntStrToNumber}
        />
      }
      modalFooter={
        <Button>
          <CopyToClipboard shouldShowText={false} text={jsonValue} />
        </Button>
      }
      modalTitle={modalTitle}
      triggerNode={<>{jsonValue}</>}
    />
  );
};

export default JsonModal;
