# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
import json
import logging

from flask import g, request, Response
from flask_appbuilder.api import BaseApi, expose, protect, safe

from superset import app
from superset.charts.commands.exceptions import ChartNotFoundError
from superset.constants import MODEL_API_RW_METHOD_PERMISSION_MAP, RouteMethod
from superset.explore.commands.get import GetExploreCommand
from superset.explore.commands.parameters import CommandParameters
from superset.explore.exceptions import DatasetAccessDeniedError, WrongEndpointError
from superset.explore.permalink.exceptions import ExplorePermalinkGetFailedError
from superset.explore.schemas import ExploreContextSchema
from superset.extensions import event_logger
from superset.utils import core as utils
from superset.utils.core import get_user_id
from superset.views.base import common_bootstrap_payload
from superset.views.utils import bootstrap_user_data

logger = logging.getLogger(__name__)

config = app.config


class SqlRestApi(BaseApi):
    method_permission_name = MODEL_API_RW_METHOD_PERMISSION_MAP
    include_route_methods = {RouteMethod.GET}
    # allow_browser_login = True
    class_permission_name = "Superset"
    resource_name = "sql"
    # openapi_spec_tag = "Explore"
    # openapi_spec_component_schemas = (ExploreContextSchema,)

    @expose("/", methods=["GET"])
    @protect()
    @safe
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.get",
        log_to_statsd=True,
    )
    def get(self) -> Response:
        payload = {
            "defaultDbId": config["SQLLAB_DEFAULT_DBID"],
            "common": common_bootstrap_payload(),
            **self._get_sqllab_tabs(get_user_id()),
        }

        form_data = request.form.get("form_data")
        if form_data:
            try:
                payload["requested_query"] = json.loads(form_data)
            except json.JSONDecodeError:
                pass

        payload["user"] = bootstrap_user_data(g.user, include_perms=True)
        bootstrap_data = json.dumps(
            payload, default=utils.pessimistic_json_iso_dttm_ser
        )

        return self.response(200, result=bootstrap_data)
