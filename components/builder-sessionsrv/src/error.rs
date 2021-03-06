// Copyright (c) 2016 Chef Software Inc. and/or applicable contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

use std::error;
use std::fmt;
use std::num;

use db;
use hab_core;
use hab_net;
use postgres;
use protocol;
use r2d2;

pub type SrvResult<T> = Result<T, SrvError>;

#[derive(Debug)]
pub enum SrvError {
    BadPort(String),
    ConnErr(hab_net::conn::ConnErr),
    Db(db::error::Error),
    DbPoolTimeout(r2d2::GetTimeout),
    DbTransactionStart(postgres::error::Error),
    DbTransactionCommit(postgres::error::Error),
    EntityNotFound,
    HabitatCore(hab_core::Error),
    Protocol(protocol::ProtocolError),
    AccountIdFromString(num::ParseIntError),
    AccountCreate(postgres::error::Error),
    AccountGet(postgres::error::Error),
    AccountGetById(postgres::error::Error),
    SessionGet(postgres::error::Error),
    AccountOriginInvitationCreate(postgres::error::Error),
    AccountOriginInvitationList(postgres::error::Error),
    AccountOriginInvitationAccept(postgres::error::Error),
    OriginAccountList(postgres::error::Error),
    OriginCreate(postgres::error::Error),
}

impl fmt::Display for SrvError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let msg = match *self {
            SrvError::BadPort(ref e) => format!("{} is an invalid port. Valid range 1-65535.", e),
            SrvError::ConnErr(ref e) => format!("{}", e),
            SrvError::Db(ref e) => format!("{}", e),
            SrvError::DbPoolTimeout(ref e) => {
                format!("Timeout getting connection from the database pool, {}", e)
            }
            SrvError::DbTransactionStart(ref e) => {
                format!("Failed to start database transaction, {}", e)
            }
            SrvError::DbTransactionCommit(ref e) => {
                format!("Failed to commit database transaction, {}", e)
            }
            SrvError::EntityNotFound => format!("No value for key found"),
            SrvError::HabitatCore(ref e) => format!("{}", e),
            SrvError::Protocol(ref e) => format!("{}", e),
            SrvError::AccountIdFromString(ref e) => {
                format!("Cannot convert from string to Account ID, {}", e)
            }
            SrvError::AccountCreate(ref e) => format!("Error creating account in database, {}", e),
            SrvError::AccountGet(ref e) => format!("Error getting account from database, {}", e),
            SrvError::AccountGetById(ref e) => {
                format!("Error getting account from database, {}", e)
            }
            SrvError::SessionGet(ref e) => format!("Error getting session from database, {}", e),
            SrvError::AccountOriginInvitationCreate(ref e) => {
                format!("Error creating invitation in database, {}", e)
            }
            SrvError::AccountOriginInvitationList(ref e) => {
                format!("Error listing invitation in database, {}", e)
            }
            SrvError::AccountOriginInvitationAccept(ref e) => {
                format!("Error accepting invitation in database, {}", e)
            }
            SrvError::OriginAccountList(ref e) => {
                format!("Error listing origins for account in database, {}", e)
            }
            SrvError::OriginCreate(ref e) => {
                format!("Error creating origin for account in database, {}", e)
            }
        };
        write!(f, "{}", msg)
    }
}

impl error::Error for SrvError {
    fn description(&self) -> &str {
        match *self {
            SrvError::BadPort(_) => {
                "Received an invalid port or a number outside of the valid range."
            }
            SrvError::ConnErr(ref err) => err.description(),
            SrvError::Db(ref err) => err.description(),
            SrvError::DbPoolTimeout(ref err) => err.description(),
            SrvError::DbTransactionStart(ref err) => err.description(),
            SrvError::DbTransactionCommit(ref err) => err.description(),
            SrvError::EntityNotFound => "Entity not found in database.",
            SrvError::HabitatCore(ref err) => err.description(),
            SrvError::Protocol(ref err) => err.description(),
            SrvError::AccountIdFromString(ref err) => err.description(),
            SrvError::AccountCreate(ref err) => err.description(),
            SrvError::AccountGet(ref err) => err.description(),
            SrvError::AccountGetById(ref err) => err.description(),
            SrvError::SessionGet(ref err) => err.description(),
            SrvError::AccountOriginInvitationCreate(ref err) => err.description(),
            SrvError::AccountOriginInvitationList(ref err) => err.description(),
            SrvError::AccountOriginInvitationAccept(ref err) => err.description(),
            SrvError::OriginAccountList(ref err) => err.description(),
            SrvError::OriginCreate(ref err) => err.description(),
        }
    }
}

impl From<hab_core::Error> for SrvError {
    fn from(err: hab_core::Error) -> Self {
        SrvError::HabitatCore(err)
    }
}

impl From<hab_net::conn::ConnErr> for SrvError {
    fn from(err: hab_net::conn::ConnErr) -> Self {
        SrvError::ConnErr(err)
    }
}

impl From<protocol::ProtocolError> for SrvError {
    fn from(err: protocol::ProtocolError) -> Self {
        SrvError::Protocol(err)
    }
}

impl From<r2d2::GetTimeout> for SrvError {
    fn from(err: r2d2::GetTimeout) -> SrvError {
        SrvError::DbPoolTimeout(err)
    }
}

impl From<db::error::Error> for SrvError {
    fn from(err: db::error::Error) -> Self {
        SrvError::Db(err)
    }
}

impl From<num::ParseIntError> for SrvError {
    fn from(err: num::ParseIntError) -> Self {
        SrvError::AccountIdFromString(err)
    }
}
